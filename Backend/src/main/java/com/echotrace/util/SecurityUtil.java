package com.echotrace.util;

import com.echotrace.service.imp.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public static String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return auth.getName();
    }

    public static String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        if (auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }

        return null;
    }
}

