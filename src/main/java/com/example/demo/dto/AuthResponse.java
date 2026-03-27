package com.example.demo.dto;

public class AuthResponse {

    private String token;
    private String tipToken;
    private String username;
    private String mesaj;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tipToken, String username, String mesaj) {
        this.token = token;
        this.tipToken = tipToken;
        this.username = username;
        this.mesaj = mesaj;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipToken() {
        return tipToken;
    }

    public void setTipToken(String tipToken) {
        this.tipToken = tipToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMesaj() {
        return mesaj;
    }

    public void setMesaj(String mesaj) {
        this.mesaj = mesaj;
    }
}
