module.exports = {
// Simulate complex sync logic that takes time to parse/load
COMPLEX_CONSTANT: (() => {
let sum = 0;
for (let i = 0; i < 500000; i++) { sum += Math.pow(i, 0.5); }
return sum;
})(),
initialized: true
};
