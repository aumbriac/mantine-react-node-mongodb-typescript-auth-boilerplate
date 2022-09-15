import express, { NextFunction, Response } from 'express'
import { Request } from './interfaces/Request'
import mongoose, { ConnectOptions } from 'mongoose'
import UserModel from './models/UserModel'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { check, validationResult } from 'express-validator'

dotenv.config()

const app = express()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wrbyq.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
const accessTokenSecret = '9fbbc68fbf1da8965dc4aea67b94e20cc2bacd6f7e1545a4121dafdece7af7fad886255da6850471ad95e3ffc3f386caa7a868bf0e0ab0f0510f4c44758be3a9'
const ACCESS_TOKEN_EXPIRY = '10m'
const refreshTokenSecret = '17b3b47657067639581d4fc3f1d8a68ea540f7d45bf377a1ddcdec05c2395d60f8205864076428c730f00601791967457586ab72abbb8e487454c1e28f66f95f'
const REFRESH_TOKEN_EXPIRY = '30d'
const tempTokenSecret = '5451370f611810be7ecd2134511d5f2c67f6ee5a96e6de1ddcbdab5150c352e9840345d75a6caad37f493a2684d78bf331a7f78e4139aee86a25055147fae2ad'
const TEMP_TOKEN_EXPIRY = '5m'

let refreshTokens = []
let tempTokens = []

const generateAccessToken = async (email: string) => jwt.sign({
  email
}, accessTokenSecret, {
  expiresIn: ACCESS_TOKEN_EXPIRY
})

const generateRefreshToken = async (email: string) => jwt.sign({
  email
}, refreshTokenSecret, {
  expiresIn: REFRESH_TOKEN_EXPIRY
})

const generateTempToken = async (email: string) => jwt.sign({
    email
  }, tempTokenSecret, {
    expiresIn: TEMP_TOKEN_EXPIRY
})

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            }
            req.user = user
            next()
        })
    } else {
        res.sendStatus(401)
    }
}

mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
      } as ConnectOptions)
  .then(() => console.log('Mongoose connected'))
  .catch(err => console.error(err))

app.use(express.json(), cors())

app.listen(3001, () => {
  console.log(`Server listening on port 3001`)
})

app.post('/register', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty()
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    console.log(errors)
    const body = req.body
    const email = body.email
    const password = body.password
    let user = await UserModel.findOne({ email })
    if (!user) {
        user = new UserModel(body)
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        res.sendStatus(200)
    } else {
        res.send({
            msg: 'Username not available'
        })
    }
})

let invalidAttempts = 0

app.post('/login', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty()
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    const email = body.email
    const password = body.password
    let user = await UserModel.findOne({ email })
    if (user) {
        if (user.accountLocked){
            return res.send({
                msg: 'Account locked. Please click \'Forgot password\' to reset your password.'
            })
        }
        const validPassword = await bcrypt.compare(password, user.password!)
        if (validPassword) {
            invalidAttempts = 0
            const accessToken = await generateAccessToken(email)
            const refreshToken = await generateRefreshToken(email)
            refreshTokens.push(refreshToken)
            res.send({
                accessToken,
                refreshToken
            })
        } else {
            // Password is invalid
            invalidAttempts++
            if (invalidAttempts >= 5) {
                res.send({
                    msg: 'Account locked. Please click \'Forgot password\' to reset your password.'
                })
                user.accountLocked = true
                await user.save()
            } else if (invalidAttempts === 4) {
                res.send({
                    msg: 'Invalid credentials. Account will be locked upon additional invalid login attempt.'
                })
            } else if (invalidAttempts < 4) {
                res.send({
                    msg: 'Invalid credentials. Please try again.'
                })
            }
        }
    } else {
        // User not found
        res.send({
            msg: 'Invalid credentials. Please try again.'
        })
    }
})

app.get('/members', authenticateJWT, async (req: Request, res: Response) => {
  const users = await UserModel.find({})
  const emails = users.map(({ email }) => email)
  res.send(emails)
})

app.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  refreshTokens = refreshTokens.filter(t => t !== refreshToken)
  res.sendStatus(200)
})

app.post('/token', async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) {
      return res.sendStatus(401)
  }
  if (!refreshTokens.includes(token)) {
      return res.sendStatus(403)
  }
  jwt.verify(token, refreshTokenSecret, async (err: any, user: { email: string }) => {
      if (err) {
          return res.sendStatus(403)
      }
      const email = user.email
      const accessToken = await generateAccessToken(email)
      const refreshToken = await generateRefreshToken(email)

      refreshTokens = refreshTokens.filter(t => t !== token)
      refreshTokens.push(refreshToken)

      res.json({
          accessToken,
          refreshToken
      })
  })
})

app.post('/forgotPassword', [
    check('email', 'Email is required').isEmail()
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    const email = body.email
    const user = await UserModel.findOne({ email })
    if (user){
        const tempToken = await generateTempToken(email)
        tempTokens.push(tempToken)
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
        await transporter.sendMail({
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: `Forgot Your Password?`,
            text: `Hello ${email},
            
            Please click the following link to reset your password: http://localhost:3000/resetPassword?k=${tempToken}

            Note: Do not share this link with anyone. Also, it will expire in 5 minutes
            
            Thanks,
            A Bot`.replace(/  /g, '')
        });
        res.sendStatus(200)
    } else {
        // Invalid user, but we don't want them to know that
        res.sendStatus(200)
    }
})

app.post('/validateTempToken', async (req, res) => {
    const { token } = req.body
    jwt.verify(token, tempTokenSecret, async (err: any, user: any) => {
        if (err || !tempTokens.includes(token)) {
            return res.sendStatus(403)
        }
        if (user) {
            res.sendStatus(200)
        }
    })
})

app.post('/resetPassword', [
    check('password', 'Password is required').not().isEmpty()
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = req.body
    const token = body.k
    const password = body.password
    jwt.verify(token, tempTokenSecret, async (err: any, user: any) => {
        if (err || !tempTokens.includes(token)) {
            return res.sendStatus(403)
        }
        if (user) {
            const u = await UserModel.findOne({ email: user.email })
            if (u) {
                const salt = await bcrypt.genSalt(10)
                u.password = await bcrypt.hash(password, salt)
                u.accountLocked = false
                await u.save()
                tempTokens = tempTokens.filter((t) => t !== token)
                res.sendStatus(200)
            }
        }
    })
})

app.post('/changePassword', authenticateJWT, async (req: any, res: Response) => {
    const body = req.body
    const currentPassword = body.currentPassword
    const newPassword = body.newPassword
    if (currentPassword === newPassword){
        return res.sendStatus(400)
    }
    const user = await UserModel.findOne({ email: req.user.email })
    if (user) {
        const validPassword = await bcrypt.compare(currentPassword, user.password!)
        if (validPassword) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
            await user.save()
            res.send({ msg: 'success' })
        } else {
            res.send({ msg: 'error' })
        }
    } else {
        res.send({ msg: 'error' })
    }
})