var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai')
    proxyquire = require('proxyquire');
chai.should();
chai.use(sinonChai);

var ModelMock = require('./ModelMock'),
    keystoneStub = require('./keystoneStub'),
    userController = proxyquire('../routes/api/user', { 'keystone': keystoneStub });

describe('Controller', function () {
  var nextMock = sinon.spy(),
      reqMock = {},
      resMock = {
        status: sinon.spy(function () { return this }),
        apiResponse: sinon.spy(),
        send: sinon.spy()
      };

  describe('User', function () {
    afterEach(function () { 
      ModelMock.then.restore();
    });

    it('should response with status 200 if query is successful', function (done) {
      var data = [
        { name: 'Luke Skywalker' },
        { name: 'Obiwan Kenobi' }
      ]
      // sinon.stub(ModelMock, 'methodWithCallback').yieldsTo('onFulfill', [1]);
      sinon.stub(ModelMock, 'then').callsArgWithAsync(0, data);

      userController.list(reqMock, resMock);

      process.nextTick(function () {
        resMock.status.should.have.been.calledWith(200);
        resMock.apiResponse.should.have.been.calledWith({ users: data });
        done();
      });
    });

    it('should call next with error if query fail', function (done) {
      sinon.stub(ModelMock, 'then').callsArgWithAsync(1, new Error('Database error'));

      userController.list(reqMock, resMock, nextMock);

      process.nextTick(function () {
        nextMock.getCall(0).args[0].message.should.equal('Database error');
        done();
      });
    });
  });
});