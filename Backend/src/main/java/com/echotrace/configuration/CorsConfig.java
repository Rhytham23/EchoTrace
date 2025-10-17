package com.echotrace.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend dev server origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Allow standard methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow headers including Authorization (for JWT)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // If you need to expose headers back to frontend
        configuration.setExposedHeaders(List.of("Authorization"));

        configuration.setAllowCredentials(true); // important if you use cookies/sessions

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
