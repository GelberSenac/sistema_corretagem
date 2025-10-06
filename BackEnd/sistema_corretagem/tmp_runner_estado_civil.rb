cliente = Cliente.find(1)
puts "Antes: \\#{cliente.estado_civil.inspect} (raw: \\#{cliente.read_attribute_before_type_cast(:estado_civil).inspect})"
cliente.estado_civil = :casado
cliente.save!
cliente.reload
puts "Depois: \\#{cliente.estado_civil.inspect} (raw: \\#{cliente.read_attribute_before_type_cast(:estado_civil).inspect})"
