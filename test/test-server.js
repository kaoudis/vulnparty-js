const axios = require('axios');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const dns = require('dns');
const mocha = require('mocha');

chai.use(chaiHttp);

describe('the server', () => {
	let server = require('../server.js');

	describe('127.0.0.1', () => {
		const url = (path) => 
			`http://localhost:8888/${path}?nextRequest=http://127.0.0.1:30995`;

		it('is allowed by /private', async () => {
			await chai.request(server).get(url('private'));
			expect(dns.lookup).toHaveBeenCalledWith('http://127.0.0.1:30995/');
			expect(axios.get).toHaveBeenCalledWith('127.0.0.1:30995');
		});

		it('is not allowed by /public', async () => {
		});
	}); 

	describe('localhost', () => {
	});

	describe('0127.0.0.1', () => {
	});

	describe('google.com', () => {
	});
});
