/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const {Thread} = require('../models/models.js');
const {Reply} = require('../models/models.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get(function (req, res){
    const board = req.params.board;
    
    Thread.find({board: board}).then(async function(data) { 
      res.send(data);
    });
  })
  .post(async function (req, res){
    const board = req.params.board;

     const thread = new Thread ({
             board: board,
             text: req.body.text,
             password: req.body.delete_password,
             created_on: new Date().toISOString(),
             bumped_on: new Date().toISOString(),
             replies: []
            });
            await thread.save();
     res.redirect(`/b/${board}`);
  })
  .put(function (req, res){
    console.log(req.body);
    if (req.body.report_id) {
          Thread.findByIdAndUpdate(req.body.report_id, {$set:{reported: true, bumped_on: new Date().toISOString()}}, {new: true}).then(function(data) { 
              res.json({
                message: `thread ${req.body.report_id} reported`,
                data: data
              });
          });
    }
  })
  .delete(async function (req, res){
    Thread.findById(req.body.thread_id).then(async function(data) { 
      if (req.body.delete_password !== data.password) {
          res.send('incorrect password');
        } else if (req.body.delete_password === data.password) {
           await Thread.findByIdAndDelete(req.body.thread_id).then(function(data){
           res.send('success');
           });
        }
    });
    
  });
  
  app.route('/api/replies/:board')
  .get(function (req, res){
    Thread.findById(req.query.thread_id).then(async function(data) { 
      res.send(data);
    });
  })
  .post(async function (req, res){
    const board = req.params.board;
    
    const reply = new Reply ({
             text: req.body.text,
             password: req.body.delete_password,
             created_on: new Date().toISOString(),
             thread_id: req.body.thread_id
            });
    await reply.save();
    
    Thread.findByIdAndUpdate(req.body.thread_id, {$push:
                                                  {
                                                    replies: { 
                                                              _id: reply._id,
                                                              text: reply.text,
                                                              password: reply.password,
                                                              created_on: reply.created_on
                                                             }
                                                  }
                                                 }).then(async function(data) {
      res.redirect(`/b/${board}/${req.body.thread_id}`);
    });
    
  });

};
