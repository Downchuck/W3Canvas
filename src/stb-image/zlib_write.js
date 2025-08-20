// Port of the zlib compressor from stb_image_write.h

function zlib_bitrev(code, codebits) {
   let res = 0;
   while (codebits--) {
      res = (res << 1) | (code & 1);
      code >>= 1;
   }
   return res;
}

export function stbi_zlib_compress(data, data_len, out_len, quality) {
   let out = [];
   let bitbuf = 0;
   let bitcount = 0;

   const add = (code, codebits) => {
       bitbuf |= code << bitcount;
       bitcount += codebits;
       while (bitcount >= 8) {
           out.push(bitbuf & 0xff);
           bitbuf >>= 8;
           bitcount -= 8;
       }
   };

   const huffa = (b, c) => add(zlib_bitrev(b,c),c);
   const huff1 = (n) => huffa(0x30 + (n), 8);
   const huff2 = (n) => huffa(0x190 + (n)-144, 9);
   const huff3 = (n) => huffa(0 + (n)-256,7);
   const huff4 = (n) => huffa(0xc0 + (n)-280,8);
   const huff = (n) => ((n) <= 143 ? huff1(n) : (n) <= 255 ? huff2(n) : (n) <= 279 ? huff3(n) : huff4(n));

   out.push(0x78);
   out.push(0x5e);

   add(1,1);
   add(1,2);

   for (let i = 0; i < data_len; ++i) {
       huff(data[i]);
   }
   huff(256);

   if (bitcount) {
       add(0, 8 - bitcount);
   }

   // adler32
   let s1=1, s2=0;
   for (let i = 0; i < data_len; ++i) {
       s1 = (s1 + data[i]) % 65521;
       s2 = (s2 + s1) % 65521;
   }
   out.push((s2 >> 8) & 0xff);
   out.push(s2 & 0xff);
   out.push((s1 >> 8) & 0xff);
   out.push(s1 & 0xff);

   out_len.value = out.length;
   return new Uint8Array(out);
}
