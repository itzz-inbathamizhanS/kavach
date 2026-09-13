package com.kavach.dto;

import java.util.List;

public class CisaKevResponse {
    private String title;
    private String catalogVersion;
    private int count;
    private List<VulnerabilityDto> vulnerabilities;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCatalogVersion() { return catalogVersion; }
    public void setCatalogVersion(String catalogVersion) { this.catalogVersion = catalogVersion; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public List<VulnerabilityDto> getVulnerabilities() { return vulnerabilities; }
    public void setVulnerabilities(List<VulnerabilityDto> vulnerabilities) { this.vulnerabilities = vulnerabilities; }
}
