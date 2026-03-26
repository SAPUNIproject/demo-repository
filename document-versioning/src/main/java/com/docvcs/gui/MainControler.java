package com.docvcs.gui;

import javafx.fxml.FXML;
import javafx.scene.control.*;

public class MainControler {

    @FXML
    private TextField usernameField;

    @FXML
    private PasswordField passwordField;

    @FXML
    private ListView<String> documentList;

    @FXML
    private Label statusLabel;

    @FXML
    private void handleLogin() {
        // Само визуално
        statusLabel.setText("Login clicked: " + usernameField.getText());
        documentList.getItems().clear();
        documentList.getItems().addAll("File1.txt", "File2.txt"); // примерни файлове
    }

    @FXML
    private void handleUpload() {
        statusLabel.setText("Upload clicked");
        documentList.getItems().add("NewFile.txt"); // добавяне на примерен файл
    }
}