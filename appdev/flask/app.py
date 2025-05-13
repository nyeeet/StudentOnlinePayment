from __future__ import print_function # In python 2.7
import sys
# print(item.id, file=sys.stderr)
from flask import Flask, render_template, url_for, request, redirect, flash, session, jsonify
# from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.secret_key = "dev"
# app.config["SESSION_PERMANENT"] = False     # Sessions expire when browser closes
# app.config["SESSION_TYPE"] = "filesystem"     # Store session data on the filesystem
# Session(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appdev.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String(200), nullable=False)
    firstname = db.Column(db.String(200), nullable=False)
    lastname = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    course = db.Column(db.String(200), nullable=False)
    prelim = db.Column(db.BOOLEAN, default=False)
    midterm = db.Column(db.BOOLEAN, default =False)
    prefinal = db.Column(db.BOOLEAN, default=False)
    finals = db.Column(db.BOOLEAN, default=False)
    def __repr__(self):
        return '<User %r>' % self.id

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    tuition = db.Column(db.Integer, nullable=False)
    def __repr__(self):
        return '<Course %r>' % self.id

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    method = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    # datetime = db.Column(db.datetime, default=dt)
    def __repr__(self):
        return '<Payment %r>' % self.id

class PaymentMethod(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(200), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    def __repr__(self):
        return '<PaymentMethod %r>' % self.id

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/usersLogIn/', methods=['POST', 'GET'])
def usersLogIn():
    if request.method == 'POST':
        users = User.query.all()
        form_id = request.form.get('form_id')
        if form_id == "register":  #if registering
            registration_id = request.form['register_studentId']
            registration_password = request.form['register_password']
            registration_firstname = request.form['firstName']
            registration_lastname = request.form['lastName']
            registration_email = request.form['email']
            registration_course = request.form['course']
            users = User.query.all()
            id_is_taken = False
            for item in users:
                if item.id == registration_id:
                    id_is_taken = True # check if id is taken
                else:
                    pass
            if id_is_taken == False :
                new_user = User(id=registration_id,password=registration_password,firstname=registration_firstname,lastname=registration_lastname,email=registration_email,course=registration_course)
                try:
                    db.session.add(new_user)
                    db.session.commit()
                    session['currentuser'] = {'firstName': registration_firstname,'lastName': registration_lastname}
                    course = Course.query.filter_by(name=registration_course).first()
                    return redirect(url_for('UIhomepage', login_id=registration_id))
                    # register success
                except:
                    #id already taken
                    return 'There was an issue adding your task'
        if form_id == "login": #if login
            session.pop('currentuser', None)
            login_id = request.form['loginStudentId']
            login_password = request.form['loginPassword']
            is_login_correct = False
            for item in users:
                if item.id == int(login_id) and item.password == login_password:
                    is_login_correct = True
                    login_firstname = item.firstname
                    login_lastname = item.lastname
                    login_course = item.course
            if is_login_correct == True:  #login success
                session['currentuser'] = {'firstName': login_firstname,'lastName': login_lastname}
                return redirect(url_for('UIhomepage', login_id=login_id))
            else:
                return redirect('/usersLogIn') #login fail
    else:
        return render_template('usersLogIn.html')

@app.route('/UIhomepage/')
def UIhomepage():
    login_id = request.args.get('login_id')
    current_user = User.query.filter_by(id=int(login_id)).first()
    current_course = Course.query.filter_by(name=current_user.course).first()
    tuition = current_course.tuition
    return render_template('UIhomepage.html', login_id = login_id,tuition = tuition,current_user=current_user)

@app.route('/schedule/')
def schedule():
    login_id = request.args.get('login_id')
    current_user = User.query.filter_by(id=int(login_id)).first()
    current_course = Course.query.filter_by(name=current_user.course).first()
    tuition = current_course.tuition
    return render_template('schedule.html',login_id=login_id,current_user=current_user,tuition = tuition)

@app.route('/paymentui/', methods=['POST', 'GET'])
def paymentui():
    if request.method == 'POST':
        users = User.query.all()
        form_id = request.form.get('form_id')
        login_id = request.form.get('user_id')
        current_user = User.query.filter_by(id=int(login_id)).first()
        current_course = Course.query.filter_by(name=current_user.course).first()
        tuition = current_course.tuition
        if current_user.prefinal == True:
            paymentname = "finals"
        elif current_user.midterm == True:
            paymentname = "prefinal"
        elif current_user.prelim == True:
            paymentname = "midterm"
        elif current_user.prelim == False:
            paymentname = "prelim"

        if form_id == "credit_card":
            method = "Credit Card"
        elif form_id == "bank_transfer":
            method = "Bank Transfer"
        elif form_id == "digital_wallet":
            method = "Digital Wallet"
        else:
            return redirect(url_for('paymentui', login_id=login_id))

        new_payment = Payment(student_id=login_id,method=method,amount=tuition/4,name=paymentname)
        try:
            if current_user.prefinal == True:
                current_user.finals = True
            elif current_user.midterm == True:
                current_user.prefinal = True
            elif current_user.prelim == True:
                current_user.midterm = True
            elif paymentname == "prelim":
                current_user.prelim = True

            db.session.add(new_payment)
            db.session.commit()
            return redirect(url_for('UIhomepage', login_id=login_id))
        except:
            return redirect(url_for('usersLogIn', login_id=login_id))

    else:
        login_id = request.args.get('login_id')
        current_user = User.query.filter_by(id=int(login_id)).first()
        current_course = Course.query.filter_by(name=current_user.course).first()
        tuition = current_course.tuition
        return render_template('paymentui.html',login_id=login_id,current_user=current_user,tuition = tuition)

@app.route('/history/')
def history():
    login_id = request.args.get('login_id')
    current_user = User.query.filter_by(id=int(login_id)).first()
    current_course = Course.query.filter_by(name=current_user.course).first()
    tuition = current_course.tuition
    user_payments  = Payment.query.filter_by(student_id=int(login_id))
    return render_template('history.html',login_id=login_id,current_user=current_user,tuition = tuition,user_payments=user_payments)

if __name__ == "__main__":
    app.run(debug=True)