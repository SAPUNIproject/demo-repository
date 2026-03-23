package com.docvcs.model;

public class User {
    private String id;
    private String username;
    private String password;
    private Role role;

    public User() {}

    public User(String id, String username, String password, Role role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Getters
    public String getId()       { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public Role getRole()       { return role; }

    // Setters
    public void setId(String id)             { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role)           { this.role = role; }

    @Override
    public String toString() {
        return username + " [" + role + "]";
    }
}