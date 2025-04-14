package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/google/go-github/v47/github"
)

func retrieveApprovers(client *github.Client, repoOwner string) ([]string, error) {
	approvers := []string{}

	requiredApproversRaw := os.Getenv(envVarApprovers)
	requiredApprovers := strings.Split(requiredApproversRaw, ",")

	for i := range requiredApprovers {
		requiredApprovers[i] = strings.TrimSpace(requiredApprovers[i])
	}

	for _, approverUser := range requiredApprovers {
		expandedUsers := expandUsersFromTeam(client, repoOwner, approverUser)
		if expandedUsers != nil {
			approvers = append(approvers, expandedUsers...)
		} else {
			approvers = append(approvers, approverUser)
		}
	}

	approvers = deduplicateUsers(approvers)

	return approvers, nil
}

func expandUsersFromTeam(client *github.Client, org, team string) []string {
	fmt.Printf("Attempting to expand users from team: %s\n", team)
	users, _, err := client.Teams.ListTeamMembersBySlug(context.Background(), org, team, &github.TeamListTeamMembersOptions{})
	if err != nil {
		fmt.Printf("%v\n", err)
		return nil
	}

	userNames := make([]string, 0, len(users))
	for _, user := range users {
		userNames = append(userNames, user.GetLogin())
	}

	return userNames
}

func expandUsersFromRepo(client *github.Client, org, approvers []string) []string {
	fmt.Printf("Attempting to expand users: %v from org: %s\n", approvers, org)
	users, _, err := client.Users.ListAll(context.Background(), &github.UserListOptions{})

	if err != nil {
		fmt.Printf("%v\n", err)
		return nil
	}

	userNames := make([]string, 0, len(users))
	for _, user := range users {
		userNames = append(userNames, user.GetLogin())
	}

	return userNames
}

func deduplicateUsers(users []string) []string {
	uniqValuesByKey := make(map[string]bool)
	uniqUsers := []string{}
	for _, user := range users {
		if _, ok := uniqValuesByKey[user]; !ok {
			uniqValuesByKey[user] = true
			uniqUsers = append(uniqUsers, user)
		}
	}
	return uniqUsers
}
