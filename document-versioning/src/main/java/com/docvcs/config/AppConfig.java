package com.docvcs.config;

import com.docvcs.service.DocumentService;
import com.docvcs.service.UserService;
import com.docvcs.storage.JsonStorage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public JsonStorage jsonStorage() {
        return new JsonStorage();
    }

    @Bean
    public UserService userService(JsonStorage jsonStorage) {
        return new UserService(jsonStorage);
    }

    @Bean
    public DocumentService documentService(JsonStorage jsonStorage) {
        return new DocumentService(jsonStorage);
    }
}