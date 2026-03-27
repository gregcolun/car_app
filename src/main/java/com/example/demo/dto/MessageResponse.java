package com.example.demo.dto;

public class MessageResponse {

    private String mesaj;

    public MessageResponse() {
    }

    public MessageResponse(String mesaj) {
        this.mesaj = mesaj;
    }

    public String getMesaj() {
        return mesaj;
    }

    public void setMesaj(String mesaj) {
        this.mesaj = mesaj;
    }
}
