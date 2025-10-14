require "test_helper"

class CaracteristicaTest < ActiveSupport::TestCase
  test "valida fixture e enums" do
    c1 = caracteristicas(:one)
    c2 = caracteristicas(:two)

    assert c1.valid?, "Fixture :one deve ser válida"
    assert c2.valid?, "Fixture :two deve ser válida"

    assert_equal "privativa", c1.tipo_caracteristica, "Enum tipo_caracteristica deve ser privativa"
    assert_equal "comodos", c1.categoria, "Enum categoria deve ser comodos"

    assert_equal "comum", c2.tipo_caracteristica, "Enum tipo_caracteristica deve ser comum"
    assert_equal "infraestrutura", c2.categoria, "Enum categoria deve ser infraestrutura"
  end

  test "nao permite nome duplicado para mesmo tipo" do
    c1 = Caracteristica.new(nome: "Quarto", tipo_caracteristica: :privativa, categoria: :comodos)
    assert_not c1.save, "Não deve salvar nome duplicado no mesmo tipo"
    assert_includes c1.errors[:nome], "has already been taken"
  end

  test "permite nome igual com tipo diferente" do
    c = Caracteristica.new(nome: "Quarto", tipo_caracteristica: :comum, categoria: :infraestrutura)
    assert c.save, "Deve salvar mesmo nome em tipo diferente"
  end
end
