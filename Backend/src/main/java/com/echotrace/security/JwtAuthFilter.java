package com.echotrace.security;

import com.echotrace.service.imp.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@AllArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final CustomUserDetailsService userDetailsService;

@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    // Handle preflight request immediately
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
        response.setStatus(HttpServletResponse.SC_OK);
        return; // stop filter chain
    }

    String authHeader = request.getHeader("Authorization");

    // Skip public endpoints
    String path = request.getServletPath();

    // Skip JWT check for public endpoints
    if (path.startsWith("/swagger") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/api/auth") ||
            path.startsWith("/uploads")) {
        filterChain.doFilter(request, response);
        return;
    }//Skip JWT validation for WebSocket handshake
    if (path.startsWith("/reminders")) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        if (username == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            throw new RuntimeException("Invalid JWT token");
        }

        var userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid JWT token");
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    } catch (Exception e) {
        // Clear context and throw exception to be handled by Spring Security
        SecurityContextHolder.clearContext();
        throw new org.springframework.security.authentication.BadCredentialsException("Invalid JWT token", e);
    }
}

}



