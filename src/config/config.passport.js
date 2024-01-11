import passport from 'passport'
import local from 'passport-local'
import github from 'passport-github2'
import { UsuariosModelo } from '../dao/models/usuarios.model.js'
import { creaHash, validaPassword } from '../utils.js'



// exporto 
export const inicializarPassport=()=>{

// ESTRATEGIA LOCAL
    passport.use('registro', new local.Strategy(
        {
            passReqToCallback: true, usernameField: 'email' 
        },
        async(req, username, password, done)=>{
            try {
                console.log("Estrategia local registro de Passport...!!!")
                let {nombre, email}=req.body
                if(!nombre || !email || !password){
                    return done(null, false)
                }
            
                let regMail=/^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
                console.log(regMail.test(email))

                if(!regMail.test(email)){
                     return done(null, false)
                }
            
                let existe=await UsuariosModelo.findOne({email})
                if(existe){
                    return done(null, false)
                }

                if (email === 'adminCoder@coder.com') {
                    try {
                        let usuario = await UsuariosModelo.create({ nombre, email, password, rol: 'administrador' });
                        return done(null, usuario)
                    } catch (error) {
                        return done(null, false)
                    }
                } else {
                    password = creaHash(password);
                    try { 
                        let usuario = await UsuariosModelo.create({ nombre, email, password});
                        return done(null, usuario)
                    } catch (error) {
                        return done(null, false)
                    }
                }
                   
            } catch (error) {
                return done(error)
            }
        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email'
        },
        async(username, password, done)=>{
            try {
                
                if (!username || !password) {
                    return done(null, false)
                }
            
                let usuario = await UsuariosModelo.findOne({ email: username}).lean();
            
                if (!usuario) {
                    return done(null, false)
                }
            
                if (!validaPassword(usuario, password)) {
                    return done(null, false)
                }  
                delete usuario.password
                return done(null, usuario)
                 
            } catch (error) {
                done(error, null)
            }
        }
    ))


    // ESTRATEGIA DE LOGIN CON GITHUB O 3EROS
    passport.use('github', new github.Strategy(
        {
            clientID: "Iv1.fbe5e6fd3004c588", 
            clientSecret: "2c5119157bc2b281398a3edc7feef65c90682651", 
            callbackURL: "http://localhost:3012/api/login/callbackGithub", 
        },
        async(accessToken, refreshToken, profile, done)=>{
            try {
                // console.log(profile)
                let usuario=await UsuariosModelo.findOne({email: profile._json.email}).lean();
                if(!usuario){
                    let nuevoUsuario={
                        nombre: profile._json.name,
                        email: profile._json.email, 
                    }

                    usuario=await UsuariosModelo.create(nuevoUsuario)
                }
                delete usuario.password
                return done(null, usuario)


            } catch (error) {
                return done(error)
            }
        }
    ))
    
    
    // configurar serializador y deserializador porque uso passport con session
    passport.serializeUser((usuario, done)=>{
        return done(null, usuario._id)
    })

    passport.deserializeUser(async(id, done)=>{
        let usuario=await UsuariosModelo.findById(id)
        return done(null, usuario)
    })

} 