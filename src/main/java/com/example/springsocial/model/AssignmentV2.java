package com.example.springsocial.model;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public class AssignmentV2 {

    private String _id;

    private LocalDate created_at;

    private LocalDate update_at;

    private String name;

    private float point;

    private User[] grades ;

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public LocalDate getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDate created_at) {
        this.created_at = created_at;
    }

    public LocalDate getUpdate_at() {
        return update_at;
    }

    public void setUpdate_at(LocalDate update_at) {
        this.update_at = update_at;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public float getPoint() {
        return point;
    }

    public void setPoint(float point) {
        this.point = point;
    }

    public User[] getGrades() {
        return grades;
    }

    public void setGrades(User[] grades) {
        this.grades = grades;
    }
}