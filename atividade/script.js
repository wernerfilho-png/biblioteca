/* ===================== CONFIGURAÇÃO ===================== */
const CHAVE_STORAGE = "usuariosClube";
const SENHA_MIN = 6; // Teste de regressão: altere para 8 e valide novamente

/* ===================== VALIDAÇÕES (funções separadas) ===================== */
function validarNome(nome) {
  return nome.trim().length >= 3;
}

function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validarSenha(senha) {
  return senha.length >= SENHA_MIN && /\d/.test(senha);
}

function validarConfirmacao(senha, confirmar) {
  return confirmar !== "" && senha === confirmar;
}

/* ===================== PERSISTÊNCIA (localStorage) ===================== */
function obterUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
}

function salvarUsuario(usuario) {
  const usuarios = obterUsuarios();
  const email = usuario.email.trim().toLowerCase();

  if (usuarios.some(u => u.email === email)) {
    return { ok: false, msg: "Este email já está cadastrado." };
  }

  usuarios.push({ nome: usuario.nome.trim(), email: email, senha: usuario.senha });
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarios));
  return { ok: true, msg: "Cadastro realizado com sucesso!" };
}

function autenticar(email, senha) {
  const usuarios = obterUsuarios();
  const usuario = usuarios.find(u => u.email === email.trim().toLowerCase());

  if (!usuario || usuario.senha !== senha) {
    return { ok: false, msg: "Email ou senha inválidos." };
  }
  return { ok: true, msg: "Login realizado com sucesso! Bem-vindo(a), " + usuario.nome + "!", usuario: usuario };
}

/* ===================== INTERFACE ===================== */
function mostrarMensagem(idElemento, texto, tipo) {
  const el = document.getElementById(idElemento);
  el.textContent = (tipo === "sucesso" ? "✅ " : "❌ ") + texto;
  el.className = "mensagem " + (tipo === "sucesso" ? "sucesso-msg" : "erro-msg");
}

function marcarCampo(input, valido, idErro, textoErro) {
  input.classList.remove("erro", "sucesso");
  input.classList.add(valido ? "sucesso" : "erro");
  if (idErro) {
    document.getElementById(idErro).textContent = valido ? "" : textoErro;
  }
}

function limparMarcacoes(form) {
  form.querySelectorAll("input").forEach(i => i.classList.remove("erro", "sucesso"));
  form.querySelectorAll(".erro-texto").forEach(s => (s.textContent = ""));
}

function cadastrar(event) {
  if (event) event.preventDefault();

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");

  let valido = true;

  const nomeOk = validarNome(nome.value);
  marcarCampo(nome, nomeOk, "erroNome",
    nome.value.trim() === "" ? "Nome obrigatório." : "O nome precisa ter no mínimo 3 caracteres.");
  if (!nomeOk) valido = false;

  const emailOk = validarEmail(email.value);
  marcarCampo(email, emailOk, "erroEmail", "Formato de email inválido (ex: nome@dominio.com).");
  if (!emailOk) valido = false;

  const senhaOk = validarSenha(senha.value);
  marcarCampo(senha, senhaOk, "erroSenha",
    "A senha precisa ter no mínimo " + SENHA_MIN + " caracteres e pelo menos 1 número.");
  if (!senhaOk) valido = false;

  const confOk = validarConfirmacao(senha.value, confirmar.value);
  marcarCampo(confirmar, confOk, "erroConfirmar", "As senhas não coincidem.");
  if (!confOk) valido = false;

  if (!valido) {
    mostrarMensagem("mensagemCadastro", "Verifique os campos destacados!", "erro");
    return;
  }

  const resultado = salvarUsuario({ nome: nome.value, email: email.value, senha: senha.value });
  mostrarMensagem("mensagemCadastro", resultado.msg, resultado.ok ? "sucesso" : "erro");

  if (!resultado.ok) {
    marcarCampo(email, false, "erroEmail", resultado.msg);
  }
}

function logar(event) {
  if (event) event.preventDefault();

  const email = document.getElementById("loginEmail");
  const senha = document.getElementById("loginSenha");

  if (!validarEmail(email.value) || senha.value === "") {
    marcarCampo(email, validarEmail(email.value));
    marcarCampo(senha, senha.value !== "");
    mostrarMensagem("mensagemLogin", "Informe um email válido e a senha.", "erro");
    return;
  }

  const resultado = autenticar(email.value, senha.value);
  marcarCampo(email, resultado.ok);
  marcarCampo(senha, resultado.ok);
  mostrarMensagem("mensagemLogin", resultado.msg, resultado.ok ? "sucesso" : "erro");
}

function alternarAba(aba) {
  const formCadastro = document.getElementById("formCadastro");
  const formLogin = document.getElementById("formLogin");
  const tabCadastro = document.getElementById("tabCadastro");
  const tabLogin = document.getElementById("tabLogin");

  const ehCadastro = aba === "cadastro";
  formCadastro.classList.toggle("oculto", !ehCadastro);
  formLogin.classList.toggle("oculto", ehCadastro);
  tabCadastro.classList.toggle("ativa", ehCadastro);
  tabLogin.classList.toggle("ativa", !ehCadastro);

  limparMarcacoes(formCadastro);
  limparMarcacoes(formLogin);
  document.getElementById("mensagemCadastro").textContent = "";
  document.getElementById("mensagemLogin").textContent = "";
}

/* ===================== EVENTOS ===================== */
document.getElementById("formCadastro").addEventListener("submit", cadastrar);
document.getElementById("formLogin").addEventListener("submit", logar);
document.getElementById("tabCadastro").addEventListener("click", () => alternarAba("cadastro"));
document.getElementById("tabLogin").addEventListener("click", () => alternarAba("login"));