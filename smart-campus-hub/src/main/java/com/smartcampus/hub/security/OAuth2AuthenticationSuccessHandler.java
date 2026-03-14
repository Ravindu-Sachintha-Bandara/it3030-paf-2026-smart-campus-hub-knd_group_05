package com.smartcampus.hub.security;

import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // The URL of your React frontend where you want to redirect after login
    private final String frontendCallbackUrl = "http://localhost:3000/login";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Handle logic to register or update user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider("google");
            // Default new users to USER role. Admin roles can be assigned manually via DB
            // or internal system.
            newUser.setRole(User.Role.USER);
            return userRepository.save(newUser);
        });

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Redirect to Frontend with Token in URL query params.
        // Another secure approach is an HttpOnly cookie.
        response.sendRedirect(frontendCallbackUrl + "?token=" + token);
    }
}
