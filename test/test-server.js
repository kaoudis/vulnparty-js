const assert = require('assert');
const axios = require('axios');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const dns = require('dns');
const mocha = require('mocha');
const sinon = require('sinon');

chai.use(chaiHttp);


describe('the server', () => {
	const server = require('../server.js');

	var axiosGet = sinon.stub(axios, "get").callsFake((loc) => {status: 200});
	var lookup = sinon.stub(dns, "lookup").callsFake((hostname) => (null, '127.0.0.1:30995', 4));

	afterEach(() => {
		lookup.reset();
		axiosGet.reset();
	});

	describe('nextRequest=http://127.0.0.1:30995', () => {
		const url = (path) => 
			`http://localhost:8888/${path}?nextRequest=http://127.0.0.1:30995`;

		it('is not allowed by /private since the port fools private-ip', () => {
			chai
				.request(server)
				.get(url('private'))
				.end((response) => {
					expect(response).to.have.status(403);
					expect(response.body.startsWith('attempt to request'));
					done();
				});
		});

		it('should not be allowed by /public, but is', async () => {
			chai
				.request(server)
				.get(url('public'))
				.end((response) => {
					expect(response).to.have.status(200);
					expect(response.data.startsWith('attempt to request'));
					done();
				});
		});
	}); 

	describe('nextRequest=localhost', () => {
		const url = (path) => 
			`http://localhost:8888/${path}?nextRequest=localhost`;

		//lookup = sinon.stub(dns, "lookup").callsFake((hostname) => (null, '127.0.0.1', 4));

		it('should be allowed by /private', () => {
			chai
				.request(server)
				.get(url('private'))
				.end((response) => {
					expect(lookup).to.haveBeenCalledWith('http://localhost');
					expect(axiosGet).to.haveBeenCalledWith('127.0.0.1');
					expect(response.data.startsWith('attempt to request'));
					expect(response.status).toBe(200);
					done();
				});
		});
	});

	describe('0127.0.0.1', () => {
	});

	describe('google.com', () => {
	});

	server.close();
});
