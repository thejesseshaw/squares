const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../routes/index');

var should = chai.should();
const {app, runServer, closeServer} = require('../routes/index');
var storage = server.storage;

chai.use(chaiHttp);

//Tests

describe('Users', function() {
  it('should list users on GET', function() {
    return chai.request(app)
    this.timeout(15000)
      .get('/api/users')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys(
            'id', 'firstName', 'lastName', 'username');
        });
      });
  });
  it('should login users POST', function() {
    const newUser = {username: 'testusername', password: 'password123456'};
    return chai.request(app)
    this.timeout(5000)
      .post('/api/auth/login/')
      .send(newUser)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('username', 'firstname', 'lastname');
      });
  });
});

describe('Links', function() {
  it('should list links on GET', function() {
    return chai.request(app)
    this.timeout(5000)
      .get('/api/links')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys(
            'id', 'title', 'content', 'created', 'url');
        });
      });
  });

  it('should add an item on POST', function() {
    const newItem = {title: 'coffee', content: 'test content', url: "https://www.facebook.com/"};
    return chai.request(app)
    this.timeout(5000)
      .post('/api/users/:id/')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'url');
        res.body.name.should.equal(newItem.title);
        res.body.url.should.be.a('string');
      });
  });
  it('should update link on PUT', function() {
        const updateData = {
          title: 'foo',
          content: 'test content',
          url: 'https://www.facebook.com/'
        };
        return chai.request(app)
        this.timeout(3000)
          .get('/api/links')
          .then(function(res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
              .put(`/api/links/${updateData.id}`)
              .send(updateData)
          })
          .then(function(res) {
            res.should.have.status(204);
          });
      });
  it('should delete links on DELETE', function() {
    return chai.request(app)
    this.timeout(3000)
      .get('/api/links')
      .then(function(res) {
        return chai.request(app)
          .delete(`/api/links/${res.body[0].id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});