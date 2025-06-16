const request = require('supertest');
const app = require('../../app');

describe('Auth Routes', () => {
	test('GET /auth should respond with 200', async () => {
		const response = await request(app).get('/auth');
		expect(response.statusCode).toBe(200);
	});
});