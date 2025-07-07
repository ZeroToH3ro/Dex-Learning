const { Transaction } = require('@mysten/sui/transactions');

console.log('Creating transaction...');
const tx = new Transaction();
console.log('Transaction created');
console.log('Available methods:', Object.getOwnPropertyNames(tx));
console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tx)));

// Check if moveCall exists
if (tx.moveCall) {
  console.log('moveCall method exists');
} else {
  console.log('moveCall method does not exist');
}
