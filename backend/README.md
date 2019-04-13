# HIVE
## Hover Interactive Visualisation and Explanation

The backend is deployed on GCP App Engine.
To deploy the application, launch a cloud shell under the __intern-hackweek__ project.
Then, run:

```
cd HIVE/backend;
git pull;
mvn appengine:deploy;
```

It will take 1-2 minutes for the app to be deployed, and the first cold run will take ~30s, so don't be surprised.

![Deployment example](deploy.jpg?raw=true "Deployment example")