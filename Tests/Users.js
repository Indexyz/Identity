const should = require("should");
const request = require("supertest");
const db = require("mongoose");
const userSchema = require('../Db/Schema/User');
const DbDefine = require('../Define/Db');
const stringLib = require('../Utils/String');

let application = require("../App"),
    userModel = db.model(DbDefine.Db.USER_DB, userSchema);

describe("User", function () {
    describe("Register", function(){
        it("GET Register Page", function(done){
            request(application)
                .get("/auth/register")
                .expect(200)
                .end(function(err, res){ 
                    if (err) return done(err)
                    res.type.should.equal("text/html");
                    done();
                })
        })
        describe("with", function(){
            it("error email", function(done){
                request(application)
                    .post("/auth/register")
                    .send({
                        username: stringLib.randomString(8),
                        password: stringLib.randomString(16),
                        email: stringLib.randomString(4)
                    })
                    .expect(401)
                    .end(function(err, res){
                        if (err) return done(err)
                        done();
                    })
            })
            it("error username", function(done){
                request(application)
                    .post("/auth/register")
                    .send({
                        username: stringLib.randomString(2),
                        password: stringLib.randomString(16),
                        email: "test@true.mail"
                    })
                    .expect(401)
                    .end(function(err, res){
                        if (err) return done(err)
                        done();
                    })
            })
            it("error passowrd", function(done){
                request(application)
                    .post("/auth/register")
                    .send({
                        username: stringLib.randomString(8),
                        password: stringLib.randomString(5),
                        email: "test@true.mail"
                    })
                    .expect(401)
                    .end(function(err, res){
                        if (err) return done(err)
                        done();
                    })
            })
        })
        describe("on", function(){
            var randomUsername, randomPassword;
            beforeEach(function(done){
                this.timeout(6000)
                randomUsername = stringLib.randomString(8),
                randomPassword = stringLib.randomString(16);
                request(application)
                    .post("/auth/register")
                    .send({
                        username: randomUsername,
                        password: randomPassword,
                        email: "test@true.mail"
                    })
                    .expect(200)
                    .end(function(err, res){
                        userModel.findOne({
                            username: randomUsername
                        }, (err, doc) => {
                            if (err) return done(err);
                            if (!doc) return done(new Error("Not found user"))
                            done();
                        })
                })
            })
            it("resend email", function(done){
                request(application)
                    .get("/auth/resend?mail=test@true.mail")
                    .expect(200)
                    .end(done)
            })
            it("resend email with error address", function(done){
                request(application)
                    .get("/auth/resend")
                    .expect(302)
                    .end(done)
            })
            it("Email Verify", function(done){
                request(application)
                    .post("/auth/register")
                    .send({
                        username: randomUsername,
                        password: randomPassword,
                        email: "test@true.mail"
                    })
                    .expect(200)
                    .end(function(err, res){
                        if (err) return done(err);
                        userModel.findOne({
                            username: randomUsername
                        }).then(doc => {
                            request(application)
                                .get("/auth/email?code=" + doc.emailToken)
                                .expect(302)
                                .end(function(err, res){
                                    if (err) return done(err);
                                    done()
                                })
                        })
                    })
            })
            it("exists user check", function(done){
                request(application)
                    .post("/auth/register")
                    .send({
                        username: randomUsername,
                        password: randomPassword,
                        email: "test@true.mail"
                    })
                    .expect(200)
                    .end(function(err, res){
                        if (err) return done(err)
                        res.text.indexOf("duplicate key error").should.not.equal(-1)
                        done()
                    })
            })
            afterEach(function(done){
                userModel.remove({
                    username: randomUsername
                }, done)
            })
        })
    })
    describe("Login", function(){
        var user, cookies, password;
        beforeEach(function(done){
            password = stringLib.randomString(16)
            user = new userModel({
                username: stringLib.randomString(8),
                password: password,
                email: "test@email.com"
            })
            user.generatorID();
            user.refresh();
            user.refreshSession();
            user.save(err => {
                if (err) return done(err);
                done();
            })
        })
        it("Get Login Page", function(done){
            request(application)
                .get('/auth/login')
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    res.type.should.equal("text/html");
                    done();
                })
        })
        it("Login in", function(done){
            request(application)
                .post('/auth/login')
                .send({
                    username: user.username,
                    password: password
                })
                .expect(302)
                .end(function(err, res){
                    if(err) return done(err);
                    res.text.indexOf("mdl-chip__contact").should.equal(-1)
                    done();
                })
        })
        it("Login in with redirect", function(done){
            request(application)
                .post('/auth/login?redirect=/')
                .send({
                    username: user.username,
                    password: password
                })
                .expect(302)
                .end(function(err, res){
                    if(err) return done(err);
                    res.text.should.equal("Found. Redirecting to /")
                    done();
                })
        })
        it("Error password", function(done){
            request(application)
                .post('/auth/login')
                .send({
                    username: user.username,
                    password: "error"
                })
                .expect(200)
                .end(function(err, res){
                    if(err) return done(err);
                    res.text.indexOf("close").should.not.equal(-1)
                    done();
                })
        })

        describe("database",function(){

            it("compare password with error password", function(){
                user.comparePassword("error-password").should.be.false();
            })

            it("compare with true passowrd", function(){
                user.comparePassword(password).should.not.be.false();
            })

        })

        afterEach(function(done){
            userModel.remove({
                _id: user._id
            }, err => {
                if (err) return done(err)
                done();
            })
        })
    })
})