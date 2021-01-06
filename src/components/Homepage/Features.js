import { Card, List } from 'semantic-ui-react';

export default function Features() {
  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Features</Card.Header>
      </Card.Content>
      <Card.Content>
        <List relaxed>
          <List.Item>
            <List.Header>Player-Ran Simulaton</List.Header>
            Everything in State of Turmoil is controlled by the players.
            Here, the players have all the power and control not only their own destinies but the fate of the world itself!
          </List.Item>
          <List.Item>
            <List.Header>In-Depth Mechanics</List.Header>
            State of Turmoil has a variety of unique mechanics and features to set it apart from similar games.
            We pride ourselves on our attention to detail and depth of our features to truly make a great simulation of the world.
          </List.Item>
          <List.Item>
            <List.Header>Caters to all Gameplay Styles</List.Header>
            Every player is a unique individual and has their own gameplay preferences and styles. So whether you want to be an author of a popular newspaper,
            a wealthy businessman, prominent politician, a patriotic soldier, or ruthless mercenary -- we have something for all players to enjoy!
          </List.Item>
        </List>
      </Card.Content>
    </Card>
  );
}