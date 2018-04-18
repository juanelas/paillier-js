'use strict';
const crypto = require('crypto');
const bigInt = require('big-integer');
let buf = crypto.randomBytes(2);
buf[0] = buf[0] | 128;
console.log(buf.toString('hex'));
let arr = [...buf];
let bn = bigInt.fromArray(arr, 256);
console.log(bn.toString(16));

