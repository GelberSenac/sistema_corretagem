# app/models/refresh_token.rb
class RefreshToken < ApplicationRecord
  belongs_to :usuario

  # Armazenar hash do token, nunca o token puro
  validates :token_hash, presence: true, uniqueness: true
  validates :device_fingerprint, presence: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked_at: nil).where('expires_at > ?', Time.current) }

  def active?
    revoked_at.nil? && expires_at.present? && expires_at > Time.current
  end
end