module.exports = {
  'database': 'mongodb://127.0.0.1:27017/nwt',
  'secret': 'lukajezakon',
  'tokenExpiration': 86400, // in seconds, 86400 sec = 24 h
  'emailConfirmation': {
    'expirationTime': 86400, // 24h
    'verificationURL': 'http://127.0.0.1:3000/#/emailConfirmation/${CODE}',
    'tokenLength': 48,
    'transportOptions': {
      service: 'Gmail',
      auth: {
        user: 'partyguide.nwt@gmail.com',
        pass: 'UnoMomento123!'
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <partyguide.nwt@gmail.com>',
        subject: 'Confirm your account',
        html: '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
                'paste the following link into your browser:</p><p>${URL}</p>',
        text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
    },
    shouldSendConfirmation: true,
    confirmMailOptions: {
        from: 'Do Not Reply <partyguide.nwt@gmail.com>',
        subject: 'Successfully verified!',
        html: '<p>Your account has been successfully verified.</p>',
        text: 'Your account has been successfully verified.'
    }
  },
  'resetPassword':{
    tokenLength:64,
    expirationTime:360, // 1h
    resetURL:'http://localhost:3000/#/reset-password/${CODE}',
    resetMailOptions:{
      from: 'Do Not Reply <partyguide.nwt@gmail.com>',
      subject: 'Reset your password',
      html: '<p>Reset your password by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
              'paste the following link into your browser:</p><p>${URL}</p>',
      text: 'Reset your password by clicking the following link, or by copying and pasting it into your browser: ${URL}'
    },
    transportOptions: {
      service: 'Gmail',
      auth: {
        user: 'partyguide.nwt@gmail.com',
        pass: 'UnoMomento123!'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
}
