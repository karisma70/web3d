/**
 * Created by Administrator on 2017-10-22.
 */
/**
 * Created by david on 2016-09-19.
 */
const FLT_MAX = 99999999.0;
const FLT_MIN = -99999999.0;

function GetMaterialColor( binarySrc ){
    this.red = binarySrc.getFloat();
    this.green = binarySrc.getFloat();
    this.blue = binarySrc.getFloat();
    this.alpha = binarySrc.getFloat();

    return this;
}

function GetAABB( AABBArr ){
    var retAABB = { minX: FLT_MAX, minY: FLT_MAX, minZ: FLT_MAX, maxX : FLT_MIN, maxY: FLT_MIN, maxZ: FLT_MIN };

    for( var Idx in AABBArr ){
        var AABB = AABBArr[Idx ];

        if( AABB.minX < retAABB.minX )
            retAABB.minX = AABB.minX;
        if( AABB.minY < retAABB.minY )
            retAABB.minY = AABB.minY;
        if( AABB.minZ < retAABB.minZ )
            retAABB.minZ = AABB.minZ;

        if( AABB.maxX > retAABB.maxX )
            retAABB.maxX = AABB.maxX;
        if( AABB.maxY > retAABB.maxY )
            retAABB.maxY = AABB.maxY;
        if( AABB.maxZ > retAABB.maxZ )
            retAABB.maxZ = AABB.maxZ;

    }

    return retAABB;
}

function getSbmHeader( srcBinWrap )
{
    this.formatName = srcBinWrap.getString(8);  // 8byrte skip

    // switch endian:
    srcBinWrap.bigEndian = false;

    // read version:
    var version = srcBinWrap.getByte();
    var material_count = srcBinWrap.getShort();
    var mesh_count = srcBinWrap.getShort();

    this.header = {
        version : version,
        material_count : material_count,
        mesh_count : mesh_count
    };

    return this.header;
}

function getSbmMaterial( srcBinWrap, material_count ){
    if( material_count < 1 ) {
        alert("Material Error!! Material Count is : " + material_count );
        return;
    }

    this.materials = {
        material_count : material_count,
        Array : []
    };

    for( var vMatIdx = 0; vMatIdx < material_count; vMatIdx ++ ) {
        var vMaterial = { nID: 0, ambient : null, diffuse : null, specular : null, nFaceNum : 0,  strTexName: ''  };
        vMaterial.nID = srcBinWrap.getShort();

        var vAmbient = new GetMaterialColor( srcBinWrap );
        vMaterial.ambient = vAmbient;

        var vDiffuse = new GetMaterialColor( srcBinWrap );
        vMaterial.diffuse = vDiffuse;

        var vSpecular = new GetMaterialColor( srcBinWrap );
        vMaterial.specular = vSpecular;

        vMaterial.nFaceNum = srcBinWrap.getByte();
        vMaterial.strTexName = srcBinWrap.getString( srcBinWrap.getShort() );

        this.materials.Array.push( vMaterial );
    }
    return  this.materials;
}



function ConstructMesh( src, version ){
    this.meshID = src.getShort();
    this.materialID = src.getShort();
    this.vertexCount = src.getShort();

    this.AABB = { minX: FLT_MAX, minY: FLT_MAX, minZ: FLT_MAX, maxX: FLT_MIN, maxY: FLT_MIN, maxZ: FLT_MIN };
    this.vertices = [];

    for( var verIdx = 0; verIdx < this.vertexCount; verIdx ++ ){

/*
        var posX = src.getFloat() / 10.0 ;
        var posY = src.getFloat() / 10.0;
        var posZ = src.getFloat() / 10.0;
*/


         var posX = src.getFloat();
         var posY = src.getFloat();
         var posZ = src.getFloat();


        if( posX < this.AABB.minX ){
            this.AABB.minX = posX;
        }
        if( posX > this.AABB.maxX ){
            this.AABB.maxX = posX;
        }
        if( posY < this.AABB.minY ){
            this.AABB.minY = posY;
        }
        if( posY > this.AABB.maxY ){
            this.AABB.maxY = posY;
        }
        if( posZ < this.AABB.minZ ){
            this.AABB.minZ = posZ;
        }
        if( posZ > this.AABB.maxZ ){
            this.AABB.maxZ = posZ;
        }

        this.vertices.push( new THREE.Vector3( posX, posY, posZ ) );
    }

    if( version == 1 ) {  //  LSM version 1 이면....
        this.normalCount = src.getShort();
        this.normals = [];

        for (var normIdx = 0; normIdx < this.normalCount; normIdx++) {
            this.normals.push(src.getFloat(), src.getFloat(), src.getFloat());
        }

        /*
         this.uvCount = src.getShort();
         this.uvs = [];

         for (var uvIdx = 0; uvIdx < this.uvCount; uvIdx++) {
         this.uvs.push(src.getFloat(), src.getFloat());
         }
         */

    }

    this.faceCount = src.getShort();
    this.faces = [];

    for( var faceIdx = 0; faceIdx < this.faceCount; faceIdx ++ ){
        this.faces.push( new THREE.Face3(src.getShort(), src.getShort(), src.getShort() ) );
    }

    return this;
}


function SbmMesh( srcBinWrap, sbmHeader ) {

    if ( sbmHeader.mesh_count < 1) {
        alert("Mesh Error!! Mesh Count is : " + mesh_count );
        return;
    }

    var totalVertexCount = 0;
    var totalFaceCount = 0;

    var AABBArr = [];

    this.meshs = {
        mesh_count : sbmHeader.mesh_count,
        vertex_count : 0,
        face_count : 0,
        Array : [],
        AABB : null
    };

    for( var vMeshIdx = 0; vMeshIdx < sbmHeader.mesh_count; vMeshIdx ++ ) {
        var mesh = new ConstructMesh( srcBinWrap, sbmHeader.version );
        this.meshs.vertex_count += mesh.vertexCount;
        this.meshs.face_count += mesh.faceCount;
        this.meshs.Array.push( mesh );
        AABBArr.push( mesh.AABB );
    }

    this.meshs.AABB = new GetAABB( AABBArr );

    console.log( "mesh count :  " + this.meshs.Array.length );

    /*
     var totVertexCount = 0;
     var totFaceCount = 0;

     for( var vMeshIdx = 0; vMeshIdx < sbmHeader.mesh_count; vMeshIdx ++ ) {
     var mesh = this.meshs.Array[vMeshIdx];
     totVertexCount += mesh.vertexCount;
     totFaceCount += mesh.faceCount;
     }

     console.log( "total vertex count : " + totVertexCount );
     console.log( "total face count : " + totFaceCount );
     */

    return this.meshs;
}



function SbmFile( srcBinaryFile ) {

    var srcBinWrap = new BinaryFileWrapper( srcBinaryFile );

    this.header = getSbmHeader( srcBinWrap );
    this.materials = getSbmMaterial( srcBinWrap, this.header.material_count );
    this.meshs = SbmMesh( srcBinWrap, this.header );

    return this;
}
