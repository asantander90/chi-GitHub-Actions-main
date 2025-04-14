package main

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/google/go-github/v47/github"
	"golang.org/x/oauth2"
)

func newGithubClient(ctx context.Context) *github.Client {
	token := os.Getenv(envVarToken)
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	tc := oauth2.NewClient(ctx, ts)
	return github.NewClient(tc)
}

func validateInput() error {
	missingEnvVars := []string{}
	if os.Getenv(envVarRepoFullName) == "" {
		missingEnvVars = append(missingEnvVars, envVarRepoFullName)
	}

	if os.Getenv(envVarRunID) == "" {
		missingEnvVars = append(missingEnvVars, envVarRunID)
	}

	if os.Getenv(envVarRepoOwner) == "" {
		missingEnvVars = append(missingEnvVars, envVarRepoOwner)
	}

	if os.Getenv(envVarToken) == "" {
		missingEnvVars = append(missingEnvVars, envVarToken)
	}

	if os.Getenv(envVarApprovers) == "" {
		missingEnvVars = append(missingEnvVars, envVarApprovers)
	}

	if len(missingEnvVars) > 0 {
		return fmt.Errorf("missing env vars: %v", missingEnvVars)
	}
	return nil
}

func main() {
	if err := validateInput(); err != nil {
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}

	repoFullName := os.Getenv(envVarRepoFullName)
	runID, err := strconv.Atoi(os.Getenv(envVarRunID))
	if err != nil {
		fmt.Printf("error getting runID: %v\n", err)
		os.Exit(1)
	}
	repoOwner := os.Getenv(envVarRepoOwner)

	ctx := context.Background()
	client := newGithubClient(ctx)

	approvers, err := retrieveApprovers(client, repoOwner)
	if err != nil {
		fmt.Printf("error retrieving approvers: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(approvers, repoFullName, runID)

	// create a env from scratch
	//client.Repositories.

}
