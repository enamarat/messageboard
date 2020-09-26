/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);


let Id = null;
suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
   
    suite('POST', function() {
      test('POST request is accepted by the server', function(done) {
       chai.request(server)
        .post('/api/threads/test-board')
        .send({
          board: "test-board",
          text: "test-thread",
          delete_password: "123"
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('All the fields are provided by the server', function(done) {
        chai.request(server)
        .get('/api/threads/test-board')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          Id = res.body[0]._id;
          assert.isArray(res.body);
          assert.property(res.body[0], 'replies');
          assert.property(res.body[0], 'replycount');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'board');
          assert.property(res.body[0], 'text');
          done();
        });
      });
    });
    
     suite('PUT', function() {
       test('Thread is reported', function(done) {
         chai.request(server)
        .put('/api/threads/test-board')
        .send({
          report_id: Id,
          board: "test-board"
              })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
         assert.equal(res.status, 200);
         assert.equal(res.body.message, `successfully reported`);
         done();
         });
      });
    });
    
    suite('DELETE', function() {
             test('Incorrect password', function(done) {
         chai.request(server)
          .delete('/api/threads/test-board')
          .send({ thread_id: Id,
                 delete_password: "booo"
                })
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
      
       test('Thread is deleted', function(done) {
         chai.request(server)
          .delete('/api/threads/test-board')
          .send({ thread_id: Id,
                 delete_password: "123"
                })
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    let savedThread = null;
    let savedReply = null;
    
    suite('POST', function() {
        test('Thread is created', function(done) {
       chai.request(server)
        .post('/api/threads/test-board')
        .send({
          board: "test-board",
          text: "test-thread",
          password: "123"
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          done();
        });
      });
      
        test('Thread id is obtained', function(done) {
        chai.request(server)
        .get('/api/threads/test-board')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          savedThread = res.body[0]._id;
          done();
        });
      });
      
          test('Reply is created', function(done) {
       chai.request(server)
        .post('/api/replies/:board')
        .send({
          thread_id: savedThread,
          text: "test-reply",
          delete_password: "123"
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('Necessary fields are provided by the server', function(done) {
        chai.request(server)
        .get('/api/replies/:board')
        .query({thread_id: savedThread})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'replycount');
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'board');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.property(res.body.replies[0], 'reported');
          assert.property(res.body.replies[0], '_id');
          savedReply = res.body.replies[0]._id;
          assert.property(res.body.replies[0], 'text');
          assert.property(res.body.replies[0], 'created_on');
          assert.property(res.body.replies[0], 'thread_id');
          assert.property(res.body.replies[0], 'password');
          assert.equal(res.body.replies[0].thread_id, savedThread);
          done();
        });
      });
    });
    
    suite('PUT', function() {
         test('Reply is reported', function(done) {
         chai.request(server)
        .put('/api/replies/:board')
        .send({
          reply_id: savedReply
              })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
         assert.equal(res.status, 200);
         assert.equal(res.body.message, `reply reported`);
         done();
         });
      });
    });
    
    suite('DELETE', function() {
      test('Incorrect password', function(done) {
         chai.request(server)
          .delete('/api/replies/:board')
          .send({ reply_id: savedReply,
                 delete_password: "asdw"
                })
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });
      
        test('Reply is deleted', function(done) {
         chai.request(server)
          .delete('/api/replies/:board')
          .send({ reply_id: savedReply,
                 delete_password: "123"
                })
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
  });

});
