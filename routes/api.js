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

const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get(async function (req, res){
    const board = req.params.board;
  
    await Thread.find({board: board}, "_id board text created_on bumped_on replies replycount")
         .sort({bumped_on: -1}).limit(10)
         .populate({path: 'replies', 
                    options: {
                              limit: 3,
                              sort: { created_on: -1},
                             }
                  }).exec(function(err, docs) { 
         res.send(docs);
    });
  })
  .post(async function (req, res){
    const board = req.params.board;

     const thread = new Thread ({
            _id: new mongoose.Types.ObjectId(),
             board: board,
             text: req.body.text,
             password: req.body.delete_password,
             created_on: new Date().toISOString(),
             bumped_on: new Date().toISOString()
            // replies: []
            });
            await thread.save();
     res.redirect(`/b/${board}`);
  })
  .put(function (req, res){
    if (req.body.report_id) {
          Thread.findByIdAndUpdate(req.body.report_id, {$set:{reported: true, bumped_on: new Date().toISOString()}}, {new: true}).then(function(data) { 
              res.json({
               // message: `thread ${req.body.report_id} reported`,
                message: `successfully reported`,
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
  .get(async function (req, res){
    //as in Mongoose documentation
    const thread = await Thread.findById(req.query.thread_id);
    await thread.populate('replies').execPopulate().then(function(data){
      res.send(data);
    });
    
  })
  .post(async function (req, res){
    const board = req.params.board;
    
    const reply = new Reply ({
             text: req.body.text,
             password: req.body.delete_password,
             created_on: new Date().toISOString(),
             thread_id: ObjectId(req.body.thread_id)
            });
    await reply.save();
    

    // Note to self: you must push ids of replies to the thread (to the "replies" array) before populating "replies" field of the thread. Otherwise, population won't work.
    Thread.findByIdAndUpdate(req.body.thread_id, 
                             {$push:{replies: reply._id}}
                            ).then(async function(data) {
       Thread.findByIdAndUpdate(req.body.thread_id, {$set:{bumped_on: new Date().toISOString()}, $inc: {'replycount':1} }, {new: true}).then(function(data){
         res.redirect(`/b/${board}/${req.body.thread_id}`);
       });
    });
    
  })
  .put(function (req, res) {
    if (req.body.reply_id) {
      Reply.findByIdAndUpdate(req.body.reply_id, {$set:{reported: true}}, {new: true}).then(function(data) { 
              res.json({
                message: `reply reported`,
                data: data
              });
          });
    }
  })
  .delete(function (req, res) {
       Reply.findByIdAndUpdate(req.body.reply_id, {$set:{text: '[deleted]'}}, {new: true}).then(function(data) {
            if (req.body.delete_password !== data.password) {
              res.send('incorrect password');
            } else if (req.body.delete_password === data.password) {
              res.send('success');
            }
        });
  });
  

};
