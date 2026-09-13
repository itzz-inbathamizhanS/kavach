package com.kavach.dto;

import lombok.Data;

import java.util.List;

@Data
public class MarkReviewedRequest {
    private List<String> ids;
}
