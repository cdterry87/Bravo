<?php

use App\Client;
use App\Contact;
use App\Project;
use App\Task;
use App\Issue;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create clients
        $clients = factory(Client::class, 15)->create()->each(function ($client) {
            // Create client's contacts
            $client->contacts()->saveMany(factory(Contact::class, rand(0, 5))->create([
                'client_id' => $client->first()->id,
            ]));
        });

        // Create projects
        $projects = factory(Project::class, 50)->create()->each(function ($project) {
            // Create project's tasks
            $project->tasks()->saveMany(factory(Task::class, rand(0, 5))->create([
                'project_id' => $project->first()->id,
            ]));

            // Create project's tasks
            $project->issues()->saveMany(factory(Issue::class, rand(0, 5))->create([
                'project_id' => $project->first()->id,
            ]));
        });
    }
}
