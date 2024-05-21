# Big Data Tool for Analyzing the Evolution of Geolocated Sentiments on Social Network X

## University of Castilla-La Mancha

**Author:** Sergio Díaz de la Peña  
**Academic Tutor:** Ricardo Pérez del Castillo

---

### Abstract

In today's digital age, social networks play a crucial role in the communication and analysis of public opinion, particularly during significant social and political events. This project aims to develop a robust Big Data tool for analyzing, processing, and visualizing sentiments expressed on social network X. Our tool focuses on geolocated sentiment analysis, crucial for tracking the evolution of sentiments and identifying vulnerable areas to combat disinformation campaigns. By leveraging a dataset comprising up to 3 million posts related to social protest events in Spanish-speaking countries, the tool provides a deep dive into public attitudes and emotions, offering insights into user influence and sentiment trends.

---

### Main Objective and Specific Goals

#### Main Objective
- **Design and develop a Big Data tool** to ingest, process, analyze, and visualize sentiments extracted from social network X, facilitating the understanding of attitudes and emotions during socially significant events and observing their spatial and temporal evolution.

#### Specific Objectives
- **OP1:** Ingest data from the REST API of X into a MongoDB database.
- **OP2:** Allow for the ingestion of alternative datasets in CSV format.
- **OP3:** Compute sentiment indices from the ingested messages.
- **OP4:** Design and display a dashboard showing the most positive and negative messages.
- **OP5:** Highlight the most impactful positive and negative posts and their influential users.
- **OP6:** Visualize a line graph depicting the evolution of positive, negative, and average sentiments over time.
- **OP7:** Generate a static heat map reflecting post traffic and average sentiment for specific locations.
- **OP8:** Dynamically display the heat map to show sentiment evolution over time.
- **OP9:** Create a clustered point map to display geolocated posts based on sentiment.
- **OP10:** Visualizing word clouds and trending topics for trend analysis.

---

### Repository Structure

```plaintext
.
├── .gitignore              # Configuration file for files and directories to be ignored by Git
├── README.md               # Project overview and setup instructions
├── backend/                # Contains all backend-related files
└── frontend/               # Contains all frontend-related files
