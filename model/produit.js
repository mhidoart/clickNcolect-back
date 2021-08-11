class Produit {
    constructor(id, nom, image, dt_ajout, qte, prixUnitaire, isOnPromotion, offreId) {
        this.id = id;
        this.nom = nom;
        this.image = image;
        this.dt_ajout = dt_ajout;
        this.qte = qte;
        this.prixUnitaire = prixUnitaire;
        this.isOnPromotion = isOnPromotion
        this.offreId = offreId
    }
}

module.exports = Produit;