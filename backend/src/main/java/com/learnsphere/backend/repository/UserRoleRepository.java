package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser_UserId(Long userId);
}
