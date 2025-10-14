class UsuarioSerializer < ActiveModel::Serializer
  attributes :id, :nome, :email, :login, :cpf, :ativo, :role

  # Note que NÃO incluímos 'password_digest', 'created_at', 'updated_at'
  has_one :perfil_corretor
  has_one :endereco
end