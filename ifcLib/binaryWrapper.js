
function BinaryFileWrapper( binFile ){

    this.position = 0;
    this.bigEndian = true;

    this.getByte = function() {
        var byte = binFile.getByteAt( this.position );
        this.position ++;
        return byte;
    };

    this.getLength = function() {
        return binFile.getLength();
    };

    this.getSByte = function() {   // signed char
        var sbyte = binFile.getSByteAt( this.position );
        this.position ++;
        return sbyte;
    };

    this.getShort = function() {
        var short = binFile.getShortAt( this.position, this.bigEndian );
        this.position += 2;
        return short;
    };

    this.getSShort = function() {
        var sshort = binFile.getSShortAt( this.position, this.bigEndian );
        this.position += 2;
        return sshort;
    };

    this.getLong = function() {
        var longVal = binFile.getLongAt( this.position, this.bigEndian );
        this.position += 4;
        return longVal;
    };

    this.getSLong = function() {
        var slongVal = binFile.getSLongAt(this.position, this.bigEndian );
        this.position += 4;
        return slongVal;
    };

    this.getString = function( nLength ) {
        var strVal = binFile.getStringAt( this.position, nLength );
        this.position += nLength;
        return strVal;
    };

    this.getDoubleAt = function(iOffset, bBigEndian) {
        // hugs stackoverflow
        // http://stackoverflow.com/questions/1597709/convert-a-string-with-a-hex-representation-of-an-ieee-754-double-into-javascript
        // TODO: check the endianness for something other than shapefiles
        // TODO: what about NaNs and Infinity?
        var a = binFile.getLongAt(iOffset + (bBigEndian ? 0 : 4), bBigEndian);
        var b = binFile.getLongAt(iOffset + (bBigEndian ? 4 : 0), bBigEndian);
        var s = a >> 31 ? -1 : 1;
        var e = (a >> 52 - 32 & 0x7ff) - 1023;
        return s * (a & 0xfffff | 0x100000) * 1.0 / Math.pow(2,52-32) * Math.pow(2, e) + b * 1.0 / Math.pow(2, 52) * Math.pow(2, e);
    };

    this.getDouble = function() {
        var d = this.getDoubleAt(this.position, this.bigEndian);
        this.position += 8;
        return d;
    };

    this.getFloat = function(){
        var bytes = binFile.getLongAt( this.position );
        this.position += 4;

        var sign = (bytes & 0x80000000) ? -1 : 1;
        var exponent = ((bytes >> 23) & 0xFF) - 127;
        var significand = (bytes & ~(-1 << 23));

        if (exponent == 128)
            return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

        if (exponent == -127) {
            if (significand == 0) return sign * 0.0;
            exponent = -126;
            significand /= (1 << 22);
        } else significand = (significand | (1 << 23)) / (1 << 23);

        return sign * significand * Math.pow(2, exponent);

    };

    this.getChar = function() {
        var c = binFile.getCharAt(this.position);
        this.position++;
        return c;
    };

}