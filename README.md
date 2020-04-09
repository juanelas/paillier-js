# A node.js implementation of the Paillier cryptosystem
>**THIS PROJECT IS NO LONGER MAINTAINED.** Consider switching to [paillier-bigint](https://github.com/juanelas/paillier-bigint) that it is a pure JS native implementation and will work with both Node.js and Browsers, and not just Node.js.

This is a node.js implementation relying on the [BigInteger.js](https://github.com/peterolson/BigInteger.js) library by Peter Olson.

The Paillier cryptosystem, named after and invented by Pascal Paillier in 1999, is a probabilistic asymmetric algorithm for public key cryptography. A notable feature of the Paillier cryptosystem is its homomorphic properties.

## Homomorphic properties

### Homomorphic addition of plaintexts

The product of two ciphertexts will decrypt to the sum of their corresponding plaintexts,

**D( E(m1) · E(m2) ) mod n^2 = m1 + m2 mod n**

The product of a ciphertext with a plaintext raising g will decrypt to the sum of the corresponding plaintexts,

**D( E(m1) · g^(m2) ) mod n^2 = m1 + m2 mod n**

### (pseudo-)homomorphic multiplication of plaintexts

An encrypted plaintext raised to the power of another plaintext will decrypt to the product of the two plaintexts,

**D( E(m1)^(m2) mod n^2 ) = m1 · m2 mod n**,

**D( E(m2)^(m1) mod n^2 ) = m1 · m2 mod n**.

More generally, an encrypted plaintext raised to a constant k will decrypt to the product of the plaintext and the constant,

**D( E(m1)^k mod n^2 ) = k · m1 mod n**.

However, given the Paillier encryptions of two messages there is no known way to compute an encryption of the product of these messages without knowing the private key.

## Key generation

1. Define the bit length of the modulus n, or keyLength in bits.

2. Choose two large prime numbers p and q randomly and independently of each other such that gcd( p·q, (p-1)(q-1) )=1 and n=p·q has a key length of keyLength. For instance:

    1. Generate a random prime p with a bit length of keyLength/2.

    2. Generate a random prime q with a bit length of keyLength/2.

    3. Repeat until satisfy: p != q and n with a bit length of keyLength.

3. Compute λ = lcm(p-1, q-1) with lcm(a,b) = a·b/gcd(a, b).

4. Select generator g where in Z* de n^2. g can be computed as follows (there are other ways):

    * Generate randoms λ and β in Z* of n (i.e. 0<λ<n and 0<β<n).

    * Compute g = ( λ·n + 1 ) β^n mod n^2

5. Compute the following modular multiplicative inverse

    μ = ( L( g^λ mod n^2 ) )^{-1} mod n

    where L(x) = (x-1)/n

The **public** (encryption) **key** is **(n, g)**.

The **private** (decryption) **key** is **(λ, μ)**.

## Encryption

Let m in Z* of n be the clear-text message,

1. Select random r in Z* of n

2. Compute ciphertext as: **c = g^m · r^n mod n^2**

## Decryption

Let c be the ciphertext to decrypt, where c in Z* of n^2

1. Compute the plaintext message as: **m = L( c^λ mod n^2 ) · μ mod n**

## Usage

Every input number should be a string in base 10, an integer, or a BigInteger. All the output numbers are instances of BigInteger.

```javascript
// import paillier
const paillier = require('paillier.js');

// create random keys
const {publicKey, privateKey} = paillier.generateRandomKeys(2048);

// optionally, you can create your public/private keys from known parameters
const publicKey = new paillier.PublicKey(n, g);
const privateKey = new paillier.PrivateKey(lambda, mu, p, q, publicKey);

// encrypt m
let c = publicKey.encrypt(m);

// decrypt c
let d = privateKey.decrypt(c);

// homomorphic addition of two chipertexts (encrypted numbers)
let c1 = publicKey.encrypt(m1);
let c2 = publicKey.encrypt(m2);
let encryptedSum = publicKey.addition(c1, c2);
let sum = privateKey.decrypt(encryptedSum); // m1 + m2

// multiplication by k
let c1 = publicKey.encrypt(m1);
let encryptedMul = publicKey.multiply(c1, k);
let mul = privateKey.decrypt(encryptedMul); // k · m1
```

See usage examples in `example.js`.
