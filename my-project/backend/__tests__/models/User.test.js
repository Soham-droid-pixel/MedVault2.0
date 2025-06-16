test('User model should validate correctly', () => {
	const User = require('../../models/User'); // Adjust the path as necessary
	const user = new User({ username: 'testuser', email: 'test@example.com' });
	expect(user.username).toBe('testuser');
	expect(user.email).toBe('test@example.com');
});

test('User model should fail validation with missing fields', () => {
	const User = require('../../models/User'); // Adjust the path as necessary
	const user = new User({});
	const errors = user.validateSync();
	expect(errors).toBeDefined();
	expect(errors.errors.username).toBeDefined();
	expect(errors.errors.email).toBeDefined();
});