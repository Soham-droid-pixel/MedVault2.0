test('authController should respond with a success message', async () => {
	const response = await authController.someFunction();
	expect(response).toEqual({ message: 'Success' });
});