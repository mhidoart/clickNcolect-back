class Menu {
    constructor(id, nom, dt_creation, ingredient, image, ...produits) {
        this.id = id;
        this.nom = nom;
        this.dt_creation = dt_creation;
        this.ingredient = ingredient;
        this.image = image;
        this.produits = produits;

    }
}
module.exports = Menu;