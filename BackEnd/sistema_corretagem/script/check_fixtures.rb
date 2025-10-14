# frozen_string_literal: true
require 'yaml'
require 'erb'
require 'bcrypt'
require 'active_support'
require 'active_support/core_ext'

puts "Checking fixtures in test/fixtures..."
Dir.glob('test/fixtures/*.yml').sort.each do |f|
  begin
    erb = ERB.new(File.read(f))
    rendered = erb.result
    data = YAML.safe_load(rendered, aliases: true, permitted_classes: [Date, Time, Symbol, ActiveSupport::HashWithIndifferentAccess, BCrypt::Password])
    puts "#{f} => #{data.class}"
    unless data.is_a?(Hash)
      puts "  ERROR: Top-level YAML is not a Hash. Inspect: #{data.inspect[0..200]}"
      next
    end
    data.each do |label, row|
      unless row.is_a?(Hash)
        puts "  ERROR: Row '#{label}' is not a Hash (#{row.class})."
      end
    end
  rescue => e
    puts "EXCEPTION in #{f}: #{e.class}: #{e.message}"
  end
end
puts "Done."