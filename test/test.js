'use strict';

var expect = require('chai').expect;
var paillier = require('../paillier');
var bigInt = require('big-integer');

const bitLengths = [8, 128];
let publicKey, privateKey;

for (const bitLength of bitLengths) {
    const keys = paillier.generateRandomKeys(bitLength);
    describe(`generateRandomKeys(${bitLength})`, function () {
        it('should return a publicKey and a privateKey', function () {
            expect(keys.publicKey).to.be.an.instanceOf(paillier.PublicKey);
            expect(keys.privateKey).to.be.an.instanceOf(paillier.PrivateKey);
        });
        it(`should return a public modulus of ${bitLength} bits`, function () {
            expect(keys.publicKey.bitLength).to.equal(bitLength);
        });
    });
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
}

const lengths = [2, 8];
const numbers = new Array(lengths.length);
for (let i = 0; i < numbers.length; i++) {
    numbers[i] = new Array(lengths[i]);
    for (let j = 0; j < lengths[i]; j++) {
        numbers[i][j] = bigInt.randBetween(1, publicKey.n);
    }
}

const ciphertexts = new Array(lengths.length);
numbers.forEach(function (item, i) {
    ciphertexts[i] = new Array(lengths[i]);
    item.forEach(function (number, j) {
        ciphertexts[i][j] = publicKey.encrypt(number);
    });
});

const decrypted = new Array(lengths.length);
ciphertexts.forEach(function (item, i) {
    decrypted[i] = new Array(lengths[i]);
    item.forEach(function (ciphertext, j) {
        decrypted[i][j] = privateKey.decrypt(ciphertext);
    });
});

describe('Testing encryption decryption', function () {
    const totalTests = lengths.reduce((sum, next) => sum + next);
    describe(`For ${totalTests} random r in (1,n), encrypt r with publicKey and then decrypt with privateKey: D( E(r) )`, function () {
        let testPassed = true;
        exit: for (let i = 0; i < decrypted.length; i++) {
            for (let j = 0; j < decrypted[i].length; j++) {
                if (decrypted[i][j].compare(numbers[i][j]) != 0) {
                    testPassed = false;
                    break exit;
                }
            }
        }
        it('all should return r', function () {
            expect(testPassed).equals(true);
        });
    });
});

describe('Testing homomorphic addition', function () {
    lengths.forEach(function (length, i) {
        const sumNumbers = numbers[i].reduce((sum, next) => sum.add(next).mod(publicKey.n));
        describe(`Addition of ${length} random numbers: D( E(m1)·...·E(m${length})) mod n^2 )`, function () {
            const encSum = publicKey.addition(...ciphertexts[i]);
            let d = privateKey.decrypt(encSum);
            it(`should return m1+...+m${length} mod n`, function () {
                expect(d.compare(sumNumbers)).equals(0);
            });
        });
    });
});

describe('Testing (pseudo-)homomorphic multiplication: D( E(m)^m mod n^2 )', function () {
    const encMul = publicKey.multiply(ciphertexts[0][0], numbers[0][0]);
    let d = privateKey.decrypt(encMul);
    it('should return the m^2 mod n', function () {
        expect(d.compare(numbers[0][0].modPow(2, publicKey.n))).equals(0);
    });
});