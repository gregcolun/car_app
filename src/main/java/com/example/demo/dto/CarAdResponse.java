package com.example.demo.dto;

import com.example.demo.model.CarAd;

import java.math.BigDecimal;

public class CarAdResponse {

    private Long id;
    private String titlu;
    private String descriere;
    private BigDecimal pret;
    private String nrTelefon;
    private String imagineUrl;
    private String ownerUsername;

    public static CarAdResponse fromEntity(CarAd carAd) {
        CarAdResponse response = new CarAdResponse();
        response.setId(carAd.getId());
        response.setTitlu(carAd.getTitlu());
        response.setDescriere(carAd.getDescriere());
        response.setPret(carAd.getPret());
        response.setNrTelefon(carAd.getNrTelefon());
        response.setImagineUrl(carAd.getImagineUrl());
        response.setOwnerUsername(carAd.getOwner().getUsername());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitlu() {
        return titlu;
    }

    public void setTitlu(String titlu) {
        this.titlu = titlu;
    }

    public String getDescriere() {
        return descriere;
    }

    public void setDescriere(String descriere) {
        this.descriere = descriere;
    }

    public BigDecimal getPret() {
        return pret;
    }

    public void setPret(BigDecimal pret) {
        this.pret = pret;
    }

    public String getImagineUrl() {
        return imagineUrl;
    }

    public void setImagineUrl(String imagineUrl) {
        this.imagineUrl = imagineUrl;
    }

    public String getNrTelefon() {
        return nrTelefon;
    }

    public void setNrTelefon(String nrTelefon) {
        this.nrTelefon = nrTelefon;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }
}
