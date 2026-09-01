class AuthController {
  constructor(authService) { this.authService = authService; }
  async register(req,res) { try { const u = await this.authService.register(req.body); return res.status(201).json({ success:true, data:u }); } catch(e) { return res.status(422).json({ error:e.message }); } }
  async login(req,res) { try { const { email, password } = req.body; if (!email||!password) return res.status(400).json({ error:'Email et mot de passe requis' }); const r = await this.authService.login(email,password); return res.status(200).json({ success:true, data:r }); } catch(e) { return res.status(401).json({ error:e.message }); } }
  async me(req,res) { return res.status(200).json({ success:true, data:req.user }); }
}
module.exports = AuthController;
