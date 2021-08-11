class Restaurant {
    constructor(id, name, adresse, type, dt_ajout, imgs, menus) {
        this.id = id;
        this.name = name;
        this.adresse = adresse;
        this.type = type;
        this.dt_ajout = dt_ajout;
        this.imgs = imgs; //list des images qui decrit le restaurant
        this.menus = menus; //list des menu 
    }
}


module.exports = Restaurant;