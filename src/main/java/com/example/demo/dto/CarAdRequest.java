package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CarAdRequest {

    @NotBlank(message = "Titlul este obligatoriu")
    private String titlu;

    @NotBlank(message = "Descrierea este obligatorie")
    private String descriere;

    @NotNull(message = "Prețul este obligatoriu")
    @DecimalMin(value = "0.01", message = "Prețul trebuie să fie mai mare decât 0")
    private BigDecimal pret;

    @NotBlank(message = "Numărul de telefon este obligatoriu")
    private String nrTelefon;

    private String imagineUrl;

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
}
